import { LEVELS } from './level.js';
export function createCampaign() { return { index: 0, scores: [], finished: false }; }
export function completeLevel(campaign, strokes) {
  if (campaign.finished || campaign.scores.length !== campaign.index) return false;
  campaign.scores.push(strokes);
  campaign.finished = campaign.scores.length === LEVELS.length;
  return true;
}
export function nextLevel(campaign) {
  if (campaign.finished || campaign.scores.length !== campaign.index + 1) return false;
  campaign.index++;
  return true;
}
