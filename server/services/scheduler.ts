import { db, Schedule, Team, Chore } from '../database/db';

/**
 * Generate weekly schedule using a conflict-free rotation permutation
 */
export function generateSchedulesForWeek(weekNumber: number, startDateStr: string, endDateStr: string): Schedule[] {
  const teams = db.getTeams();
  const chores = db.getChores();
  
  if (teams.length === 0 || chores.length === 0) {
    return [];
  }

  // Determine active chores for this week
  // Toilet cleaning is 'chore-3'. Appears every second week (e.g., odd weeks).
  const toiletChoreId = 'chore-3';
  const kitchenChoreId = 'chore-1';
  const garbageChoreId = 'chore-2';
  const livingChoreId = 'chore-5';

  let activeChoreIds: string[] = [];
  if (weekNumber % 2 !== 0) {
    // Odd week: Toilet cleaning is active
    activeChoreIds = [kitchenChoreId, garbageChoreId, toiletChoreId];
  } else {
    // Even week: Toilet cleaning is inactive, replace with Living Room Sweeping
    activeChoreIds = [kitchenChoreId, garbageChoreId, livingChoreId];
  }

  // Ensure we have exactly as many chores as teams by padding or slicing
  const teamIds = teams.map((t) => t.id);
  while (activeChoreIds.length < teamIds.length) {
    // Pad with other chores
    const remainingChore = chores.find((c) => !activeChoreIds.includes(c.id));
    if (remainingChore) {
      activeChoreIds.push(remainingChore.id);
    } else {
      activeChoreIds.push(chores[0].id);
    }
  }
  activeChoreIds = activeChoreIds.slice(0, teamIds.length);

  // Get previous week's schedule to prevent consecutive chores
  const previousSchedules = db.getSchedules().filter((s) => s.weekNumber === weekNumber - 1);
  const previousAssignments: Record<string, string> = {}; // teamId -> choreId
  previousSchedules.forEach((s) => {
    previousAssignments[s.teamId] = s.choreId;
  });

  // Generate all possible permutations of activeChoreIds
  const permutations: string[][] = [];
  function permute(arr: string[], m: string[] = []) {
    if (arr.length === 0) {
      permutations.push(m);
    } else {
      for (let i = 0; i < arr.length; i++) {
        const curr = arr.slice();
        const next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next));
      }
    }
  }
  permute(activeChoreIds);

  // Find a permutation that has 0 consecutive chore repetitions
  let bestPermutation: string[] = [];
  let minConflicts = Infinity;

  for (const perm of permutations) {
    let conflicts = 0;
    for (let i = 0; i < teamIds.length; i++) {
      const teamId = teamIds[i];
      const choreId = perm[i];
      if (previousAssignments[teamId] === choreId) {
        conflicts++;
      }
    }

    if (conflicts === 0) {
      bestPermutation = perm;
      break;
    }

    if (conflicts < minConflicts) {
      minConflicts = conflicts;
      bestPermutation = perm;
    }
  }

  // Create new schedules using the best permutation
  const newSchedules: Schedule[] = [];
  for (let i = 0; i < teamIds.length; i++) {
    const teamId = teamIds[i];
    const choreId = bestPermutation[i];
    
    // Check if schedule already exists to prevent duplicate generation
    const exists = db.getSchedules().some(
      (s) => s.weekNumber === weekNumber && s.teamId === teamId && s.choreId === choreId
    );

    if (!exists) {
      const schedule: Schedule = {
        id: `sched-${weekNumber}-${teamId}-${Date.now()}`,
        weekNumber,
        startDate: startDateStr,
        endDate: endDateStr,
        teamId,
        choreId,
        status: 'Pending',
      };
      db.addSchedule(schedule);
      newSchedules.push(schedule);

      // Create notification for team members
      const team = teams.find((t) => t.id === teamId);
      const chore = chores.find((c) => c.id === choreId);
      if (team && chore) {
        team.members.forEach((memberId) => {
          db.addNotification({
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            userId: memberId,
            title: 'New Schedule Generated',
            message: `Team ${team.name} has been assigned: ${chore.title} for Week ${weekNumber}.`,
            type: 'chore',
            read: false,
            createdAt: new Date().toISOString(),
          });
        });
      }
    }
  }

  return newSchedules;
}

/**
 * Generate schedules for multiple weeks
 */
export function generateFutureSchedules(weeksCount: number): Schedule[] {
  const currentSchedules = db.getSchedules();
  let maxWeek = 20; // Default base
  let lastDate = new Date('2026-06-22'); // base start date

  if (currentSchedules.length > 0) {
    const sorted = [...currentSchedules].sort((a, b) => b.weekNumber - a.weekNumber);
    maxWeek = sorted[0].weekNumber;
    lastDate = new Date(sorted[0].endDate);
  }

  const generated: Schedule[] = [];

  for (let i = 1; i <= weeksCount; i++) {
    const nextWeekNum = maxWeek + i;
    const nextStart = new Date(lastDate);
    nextStart.setDate(nextStart.getDate() + 1); // Day after previous end date
    
    const nextEnd = new Date(nextStart);
    nextEnd.setDate(nextEnd.getDate() + 6); // 6 days later

    const startStr = nextStart.toISOString().split('T')[0];
    const endStr = nextEnd.toISOString().split('T')[0];

    const weeklySchedules = generateSchedulesForWeek(nextWeekNum, startStr, endStr);
    generated.push(...weeklySchedules);
    
    // Update lastDate for subsequent loop iterations
    lastDate = nextEnd;
  }

  return generated;
}
