/* 
  AUTOGENERATED FILE
  Do not manually edit
  Run "npm run generateARMClients" to regenerate
*/

import * as Types from "./types";

/* Retrieves the metrics determined by the given filter for the given partition key range id and region. */
export async function listMetrics(
  subscriptionId: string,
  resourceGroupName: string,
  accountName: string,
  region: string,
  databaseRid: string,
  collectionRid: string,
  partitionKeyRangeId: string
): Promise<Types.PartitionMetricListResult> {
  const path = `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.DocumentDB/databaseAccounts/${accountName}/region/${region}/databases/${databaseRid}/collections/${collectionRid}/partitionKeyRangeId/${partitionKeyRangeId}/metrics`;
  return window.fetch(this.baseUrl + this.basePath + path, { method: "get" }).then(response => response.json());
}
