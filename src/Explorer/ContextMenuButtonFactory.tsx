import React from "react";
import AddCollectionIcon from "../../images/AddCollection.svg";
import AddSqlQueryIcon from "../../images/AddSqlQuery_16x16.svg";
import AddStoredProcedureIcon from "../../images/AddStoredProcedure.svg";
import AddTriggerIcon from "../../images/AddTrigger.svg";
import AddUdfIcon from "../../images/AddUdf.svg";
import DeleteCollectionIcon from "../../images/DeleteCollection.svg";
import DeleteDatabaseIcon from "../../images/DeleteDatabase.svg";
import DeleteSprocIcon from "../../images/DeleteSproc.svg";
import DeleteTriggerIcon from "../../images/DeleteTrigger.svg";
import DeleteUDFIcon from "../../images/DeleteUDF.svg";
import HostedTerminalIcon from "../../images/Hosted-Terminal.svg";
import * as ViewModels from "../Contracts/ViewModels";
import { useSidePanel } from "../hooks/useSidePanel";
import { userContext } from "../UserContext";
import { getCollectionName, getDatabaseName } from "../Utils/APITypeUtils";
import { TreeNodeMenuItem } from "./Controls/TreeComponent/TreeComponent";
import Explorer from "./Explorer";
import { useNotebook } from "./Notebook/useNotebook";
import { DeleteCollectionConfirmationPane } from "./Panes/DeleteCollectionConfirmationPane/DeleteCollectionConfirmationPane";
import { DeleteDatabaseConfirmationPanel } from "./Panes/DeleteDatabaseConfirmationPanel";
import StoredProcedure from "./Tree/StoredProcedure";
import Trigger from "./Tree/Trigger";
import UserDefinedFunction from "./Tree/UserDefinedFunction";
import { useSelectedNode } from "./useSelectedNode";

export interface CollectionContextMenuButtonParams {
  databaseId: string;
  collectionId: string;
}

export interface DatabaseContextMenuButtonParams {
  databaseId: string;
}
/**
 * New resource tree (in ReactJS)
 */
export const createDatabaseContextMenu = (container: Explorer, databaseId: string): TreeNodeMenuItem[] => {
  const items: TreeNodeMenuItem[] = [
    {
      iconSrc: AddCollectionIcon,
      onClick: () => container.onNewCollectionClicked({ databaseId }),
      label: `New ${getCollectionName()}`,
    },
  ];

  if (userContext.apiType !== "Tables" || userContext.features.enableSDKoperations) {
    items.push({
      iconSrc: DeleteDatabaseIcon,
      onClick: () =>
        useSidePanel
          .getState()
          .openSidePanel(
            "Delete " + getDatabaseName(),
            <DeleteDatabaseConfirmationPanel refreshDatabases={() => container.refreshAllDatabases()} />
          ),
      label: `Delete ${getDatabaseName()}`,
      styleClass: "deleteDatabaseMenuItem",
    });
  }
  return items;
};

export const createCollectionContextMenuButton = (
  container: Explorer,
  selectedCollection: ViewModels.Collection
): TreeNodeMenuItem[] => {
  const items: TreeNodeMenuItem[] = [];
  if (userContext.apiType === "SQL" || userContext.apiType === "Gremlin") {
    items.push({
      iconSrc: AddSqlQueryIcon,
      onClick: () => selectedCollection && selectedCollection.onNewQueryClick(selectedCollection, undefined),
      label: "New SQL Query",
    });
  }

  if (userContext.apiType === "Mongo") {
    items.push({
      iconSrc: AddSqlQueryIcon,
      onClick: () => selectedCollection && selectedCollection.onNewMongoQueryClick(selectedCollection, undefined),
      label: "New Query",
    });

    items.push({
      iconSrc: HostedTerminalIcon,
      onClick: () => {
        const selectedCollection: ViewModels.Collection = useSelectedNode.getState().findSelectedCollection();
        selectedCollection && selectedCollection.onNewMongoShellClick();
      },
      label: useNotebook.getState().isShellEnabled ? "Open Mongo Shell" : "New Shell",
    });
  }

  if (userContext.apiType === "SQL" || userContext.apiType === "Gremlin") {
    items.push({
      iconSrc: AddStoredProcedureIcon,
      onClick: () => {
        const selectedCollection: ViewModels.Collection = useSelectedNode.getState().findSelectedCollection();
        selectedCollection && selectedCollection.onNewStoredProcedureClick(selectedCollection, undefined);
      },
      label: "New Stored Procedure",
    });

    items.push({
      iconSrc: AddUdfIcon,
      onClick: () => {
        const selectedCollection: ViewModels.Collection = useSelectedNode.getState().findSelectedCollection();
        selectedCollection && selectedCollection.onNewUserDefinedFunctionClick(selectedCollection);
      },
      label: "New UDF",
    });

    items.push({
      iconSrc: AddTriggerIcon,
      onClick: () => {
        const selectedCollection: ViewModels.Collection = useSelectedNode.getState().findSelectedCollection();
        selectedCollection && selectedCollection.onNewTriggerClick(selectedCollection, undefined);
      },
      label: "New Trigger",
    });
  }

  items.push({
    iconSrc: DeleteCollectionIcon,
    onClick: () =>
      useSidePanel
        .getState()
        .openSidePanel(
          "Delete " + getCollectionName(),
          <DeleteCollectionConfirmationPane refreshDatabases={() => container.refreshAllDatabases()} />
        ),
    label: `Delete ${getCollectionName()}`,
    styleClass: "deleteCollectionMenuItem",
  });

  return items;
};

export const createStoreProcedureContextMenuItems = (
  container: Explorer,
  storedProcedure: StoredProcedure
): TreeNodeMenuItem[] => {
  if (userContext.apiType === "Cassandra") {
    return [];
  }

  return [
    {
      iconSrc: DeleteSprocIcon,
      onClick: () => storedProcedure.delete(),
      label: "Delete Store Procedure",
    },
  ];
};

export const createTriggerContextMenuItems = (container: Explorer, trigger: Trigger): TreeNodeMenuItem[] => {
  if (userContext.apiType === "Cassandra") {
    return [];
  }

  return [
    {
      iconSrc: DeleteTriggerIcon,
      onClick: () => trigger.delete(),
      label: "Delete Trigger",
    },
  ];
};

export const createUserDefinedFunctionContextMenuItems = (
  container: Explorer,
  userDefinedFunction: UserDefinedFunction
): TreeNodeMenuItem[] => {
  if (userContext.apiType === "Cassandra") {
    return [];
  }

  return [
    {
      iconSrc: DeleteUDFIcon,
      onClick: () => userDefinedFunction.delete(),
      label: "Delete User Defined Function",
    },
  ];
};
