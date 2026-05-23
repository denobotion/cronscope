/**
 * searchFilter.ts
 * Filters cron jobs by a freetext search query against relevant fields.
 */

import { CronJob } from "../types/cronJob";

/**
 * Returns true if the job matches the given search query.
 * Matches against: command, schedule expression, user, host, and description.
 */
export function jobMatchesQuery(job: CronJob, query: string): boolean {
  if (!query || query.trim() === "") return true;
  const q = query.toLowerCase();
  const fields = [
    job.command,
    job.schedule,
    job.user ?? "",
    job.host ?? "",
    job.description ?? "",
  ];
  return fields.some((field) => field.toLowerCase().includes(q));
}

/**
 * Filters an array of CronJobs by the provided search query.
 */
export function searchJobs(jobs: CronJob[], query: string): CronJob[] {
  if (!query || query.trim() === "") return jobs;
  return jobs.filter((job) => jobMatchesQuery(job, query));
}

/**
 * Highlights occurrences of query within a string using ANSI bold+yellow.
 */
export function highlightMatch(text: string, query: string): string {
  if (!query || query.trim() === "") return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  return text.replace(regex, "\x1b[1;33m$1\x1b[0m");
}
