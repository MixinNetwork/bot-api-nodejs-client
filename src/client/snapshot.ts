import { AxiosInstance } from "axios";
import { Snapshot, SnapshotClientRequest } from "../types";


export class SnapshotClient implements SnapshotClientRequest {
  request!: AxiosInstance

  readSnapshots(asset_id?: string, offset?: string, order?: string, limit?: number): Promise<Snapshot[]> {
    return this.request.get(`/snapshots`, { params: { asset_id, offset, order, limit } })
  }
  readNetworkSnapshots(asset_id?: string, offset?: string, order?: string, limit?: number): Promise<Snapshot[]> {
    return this.request.get(`/network/snapshots`, { params: { asset_id, offset, order, limit } })
  }
  readSnapshot(snapshot_id: string): Promise<Snapshot> {
    return this.request.get(`/snapshots/${snapshot_id}`)
  }
  readNetworkSnapshot(snapshot_id: string): Promise<Snapshot> {
    return this.request.get(`/network/snapshots/${snapshot_id}`)
  }
}