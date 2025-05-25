import { NextResponse } from 'next/server';
import { getMovieCredits, getTVShowCredits, getPersonCredits } from '@/lib/tmdb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MAX_RECOMMENDATIONS = 50;
const MIN_VOTE_COUNT = 50; // Lowered to include more actor-specific content
const MAX_ACTORS_TO_PROCESS = 10; // Reduced to focus on main actors
const MAX_WORKS_PER_ACTOR = 5; // Increased to get more works per important actor

// Calculate actor importance based on billing order and frequency
function calculateActorScore(
  actor: any, 
  billingPosition: number, 
  totalAppearances: number,
  averagePopularity: number
): number {
  const billingScore = Math.max(1 - (billingPosition / 10), 0); // 1.0 to 0.0 based on billing
  const frequencyScore = Math.min(totalAppearances / 3, 1); // Cap at 3 appearances
  const popularityScore = Math.min(actor.popularity / averagePopularity, 1);

  return (
    billingScore * 0.5 + // Billing position is most important
    frequencyScore * 0.3 + // Frequency of appearance
    popularityScore * 0.2 // Actor's general popularity least important
  );
}

// Calculate recommendation score based on multiple factors
function calculateRecommendationScore(
  work: any, 
  actorScore: number, 
  actorBillingPosition: number
): number {
  const popularity = work.popularity || 0;
  const voteAverage = work.vote_average || 0;
  const voteCount = work.vote_count || 0;
  const releaseDate = work.release_date || work.first_air_date;
  const isRecent = releaseDate ? 
    (new Date().getFullYear() - new Date(releaseDate).getFullYear() <= 15) : 
    false;

  // Normalize scores
  const popularityScore = Math.log10(Math.max(popularity, 1)) / 2; // Log scale for popularity
  const voteScore = voteAverage / 10;
  const voteCountWeight = Math.min(voteCount / 500, 1); // Lower threshold for actor-specific works
  const actorBillingWeight = Math.max(1 - (actorBillingPosition / 10), 0.1);
  const recentBonus = isRecent ? 0.2 : 0;

  return (
    actorScore * 0.4 + // Actor relevance most important
    popularityScore * 0.2 +
    voteScore * 0.2 +
    voteCountWeight * 0.1 +
    actorBillingWeight * 0.1 +
    recentBonus // Bonus for recent content
  );
}

export async function POST(request: Request) {
  try {
    const { selectedItems, mediaType } = await request.json();
    
    if (!selectedItems?.length) {
      return new NextResponse(JSON.stringify({ recommendations: [] }), {
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      });
    }

    // Validate items
    const validItems = selectedItems.filter(item => {
      const id = parseInt(item.id, 10);
      return !isNaN(id) && id > 0;
    });

    if (!validItems.length) {
      return new NextResponse(JSON.stringify({ recommendations: [] }), {
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      });
    }

    // Track actor appearances and collect cast information
    const actorAppearances = new Map<number, { 
      count: number, 
      popularity: number,
      bestBilling: number,
      actor: any 
    }>();
    let totalPopularity = 0;
    let actorCount = 0;

    // First pass: Gather actor statistics
    for (const item of validItems) {
      try {
        const credits = await (mediaType === 'movie' 
          ? getMovieCredits(item.id)
          : getTVShowCredits(item.id));

        if (!credits?.cast?.length) continue;

        credits.cast
          .slice(0, 10) // Consider top 10 billed cast
          .forEach((actor, index) => {
            if (!actor?.id) return;
            
            const current = actorAppearances.get(actor.id) || {
              count: 0,
              popularity: 0,
              bestBilling: 999,
              actor: actor
            };

            current.count++;
            current.popularity = Math.max(current.popularity, actor.popularity || 0);
            current.bestBilling = Math.min(current.bestBilling, index);
            current.actor = actor;
            
            actorAppearances.set(actor.id, current);
            totalPopularity += actor.popularity || 0;
            actorCount++;
          });
      } catch (error) {
        console.error(`Error processing item ${item.id}:`, error);
      }
    }

    const averagePopularity = totalPopularity / Math.max(actorCount, 1);

    // Calculate actor scores and sort
    const sortedActors = Array.from(actorAppearances.entries())
      .map(([id, data]) => ({
        id,
        score: calculateActorScore(
          data.actor,
          data.bestBilling,
          data.count,
          averagePopularity
        ),
        ...data
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ACTORS_TO_PROCESS);

    const seen = new Set(validItems.map(item => item.id));
    const recommended = new Map();

    // Get recommendations from top actors
    for (const actorData of sortedActors) {
      try {
        const actorCredits = await getPersonCredits(actorData.id.toString());
        if (!actorCredits?.cast?.length) continue;

        // Find actor's billing position in each work
        const validWorks = actorCredits.cast
          .filter(work => 
            work &&
            work.id &&
            work.media_type === mediaType &&
            work.poster_path &&
            !seen.has(work.id.toString()) &&
            work.vote_count >= MIN_VOTE_COUNT &&
            work.vote_average >= 5.5 // Lowered threshold for actor-specific works
          )
          .map(work => ({
            ...work,
            score: calculateRecommendationScore(
              work,
              actorData.score,
              actorData.bestBilling
            )
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, MAX_WORKS_PER_ACTOR);

        // Add works to recommendations
        for (const work of validWorks) {
          if (!recommended.has(work.id) && recommended.size < MAX_RECOMMENDATIONS) {
            recommended.set(work.id, {
              id: work.id.toString(),
              title: work.title || work.name,
              poster_path: work.poster_path,
              media_type: work.media_type,
              popularity: work.popularity,
              vote_average: work.vote_average,
              vote_count: work.vote_count,
              release_date: work.release_date || work.first_air_date,
              score: work.score,
              actor_name: actorData.actor.name,
              actor_character: work.character,
              actor_relevance: actorData.score.toFixed(2)
            });
            seen.add(work.id.toString());
          }
          
          if (recommended.size >= MAX_RECOMMENDATIONS) break;
        }
      } catch (error) {
        console.error(`Error processing actor ${actorData.id}:`, error);
        continue;
      }
    }

    // Convert to array and sort by score
    const recommendations = Array.from(recommended.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RECOMMENDATIONS);

    return new NextResponse(JSON.stringify({ 
      recommendations,
      debug: {
        processedActors: sortedActors.map(a => ({
          name: a.actor.name,
          score: a.score.toFixed(2),
          appearances: a.count,
          bestBilling: a.bestBilling + 1
        }))
      }
    }), {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return new NextResponse(JSON.stringify({ recommendations: [] }), {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
  }
} 