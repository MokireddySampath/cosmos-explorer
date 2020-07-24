/* 
  AUTOGENERATED FILE
  Do not manually edit
  Run "npm run generateARMClients" to regenerate
*/

import * as Types from "./types";

/* Retrieves the metrics determined by the given filter for the given account, source and target region. This url is only for PBS and Replication Latency data */
export async function listMetrics(
  subscriptionId: string,
  resourceGroupName: string,
  accountName: string,
  sourceRegion: string,
  targetRegion: string
): Promise<Types.PercentileMetricListResult> {
  const path = `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.DocumentDB/databaseAccounts/${accountName}/sourceRegion/${sourceRegion}/targetRegion/${targetRegion}/percentile/metrics`;
  return window.fetch(this.baseUrl + this.basePath + path, { method: "get" }).then(response => response.json());
}
