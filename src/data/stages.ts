import type { StageConfig } from '../types/game';
function stage(id:StageConfig['id'],titleTh:string,educationalGoalTh:string,wasteItemIds:string[]):StageConfig {
  return {id,titleTh,educationalGoalTh,wasteItemIds,targetCount:wasteItemIds.length};
}
// Stage selections follow the content team's four location lists.
export const stages: StageConfig[] = [
  stage('park','Public Park','Practise sorting general and organic waste',['banana','wrapper','leaf']),
  stage('school','School','Consider materials and cleanliness',['paper','dirty-paper','bottle','can','uht-carton','plastic-cup']),
  stage('beach','Beach','Learn how to keep waste out of the sea',['bottle','plastic-bag','can','food']),
  stage('community','Community','Review all four categories and sort hazardous waste',['battery','fluorescent-lamp','bottle','wrapper','vegetables','expired-medicine']),
];
