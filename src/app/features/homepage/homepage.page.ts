import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemSelectorComponent, ItemNode } from '../../core/shared/components/item-selector/item-selector.component'; // import { ItemSelectorComponent, ItemNode } from '@rentman/rentman-ui-components';
import { ResponseService, ResponseData, FolderRow, ItemRow } from '../../core/http/response.service';
import { firstValueFrom } from 'rxjs';

type Item = { id: number; title: string; folder_id: number };
type FolderNode = { id: number; title: string; parent_id: number | null; children: FolderNode[]; items: Item[] };

@Component({
  standalone: true,
  selector: 'app-homepage',
  imports: [CommonModule, ItemSelectorComponent],
  templateUrl: './homepage.page.html',
  styleUrl: './homepage.page.css',
})
export class HomepagePage implements OnInit {
  tree = signal<ItemNode[]>([]);
  selected = signal<number[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  constructor(private api: ResponseService) {}

  async ngOnInit() {
    try {
      const res = await firstValueFrom(this.api.getResponse());
      const folderTree = buildFolderTree(res);
      this.tree.set(folderTreeToItemNodes(folderTree));
    } catch (e: any) {
      this.error.set(e?.message ?? 'Failed to load data');
    } finally {
      this.isLoading.set(false);
    }
  }

  onSelectionChange(ids: number[]) { this.selected.set(ids); }
  clear() { this.selected.set([]); }
}

function rows<T extends any[]>(columns: string[], data: T[]) {
  return data.map(row => Object.fromEntries(columns.map((c, i) => [c, row[i]])) as any);
}

const byTitle = <T extends { title: string }>(a: T, b: T) =>
  a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });

function buildFolderTree(res: ResponseData): FolderNode[] {
  const folderRows = rows<FolderRow>(res.folders.columns, res.folders.data) as Array<{ id: number; title: string; parent_id: number | null }>;
  const itemRows = rows<ItemRow>(res.items.columns, res.items.data) as Array<{ id: number; title: string; folder_id: number }>;

  const folderMap = new Map<number, FolderNode>();
  const treeView: FolderNode[] = [];

  for (const { id, title, parent_id } of folderRows) {
    if (folderMap.has(id)) { console.warn(`Duplicate folder ID: ${id} (${title})`); continue; }
    folderMap.set(id, { id, title, parent_id, children: [], items: [] });
  }

  folderMap.forEach(folder => {
    if (folder.parent_id === null) treeView.push(folder);
    else {
      const parent = folderMap.get(folder.parent_id);
      if (parent) parent.children.push(folder);
      else console.warn(`Parent ${folder.parent_id} not found for folder ${folder.id} (${folder.title})`);
    }
  });

  for (const { id, title, folder_id } of itemRows) {
    const parent = folderMap.get(folder_id);
    if (parent) parent.items.push({ id, title, folder_id });
    else console.warn(`Item "${title}" has invalid folder_id ${folder_id}`);
  }

  const hasCycleFrom = (node: FolderNode, visited = new Set<number>()): boolean => {
    if (visited.has(node.id)){
       return true;
    }
    visited.add(node.id);
    for (const child of node.children) {
      if (hasCycleFrom(child, visited)) {
        return true;
      }
    }
    visited.delete(node.id);
    return false;
  };

  for (const root of treeView) {
    if (hasCycleFrom(root)) {
      console.error(`Cycle detected starting at folder ${root.id} (${root.title})`);
    }
  }

  const sortTree = (node: FolderNode) => {
    node.children.sort(byTitle);
    node.items.sort(byTitle);
    node.children.forEach(sortTree);
  };
  treeView.forEach(sortTree);
  treeView.sort(byTitle);

  return treeView;
}

function folderTreeToItemNodes(roots: FolderNode[]): ItemNode[] {
  const toItemNode = (f: FolderNode): ItemNode => {
    const folderNodes = f.children.map(toItemNode);
    const itemNodes = f.items.map(it => ({ id: it.id, label: it.title }));
    return { id: f.id, label: f.title, children: [...folderNodes, ...itemNodes] };
  };
  return roots.map(toItemNode);
}
