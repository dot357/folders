import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ItemNode {
  id: number;
  label: string;
  children?: ItemNode[];
}

@Component({
  standalone: true,
  selector: 'app-item-selector',
  imports: [CommonModule],
  templateUrl: './item-selector.component.html',
  styleUrl: './item-selector.component.css' // or: styleUrls: ['./item-selector.component.css']
})
export class ItemSelectorComponent {
  @Input({ required: true }) nodes: ItemNode[] = [];
  @Input() selectedIds: number[] = [];
  @Output() selectionChange = new EventEmitter<number[]>();

  private collapsed = signal<Set<number>>(new Set());

  isCollapsed = (id: number) => this.collapsed().has(id);

  toggle(id: number) {
    const set = new Set(this.collapsed());
    set.has(id) ? set.delete(id) : set.add(id);
    this.collapsed.set(set);
  }

  private includes(id: number) {
    return this.selectedIds?.includes(id);
  }

  isChecked(id: number) {
    return this.includes(id);
  }

  isIndeterminate(n: ItemNode): boolean {
    if (!n.children?.length) return false;
    const flat = this.flatten([n]).filter(x => x.id !== n.id).map(x => x.id);
    const hits = flat.filter(id => this.includes(id)).length;
    return hits > 0 && hits < flat.length;
  }

  toggleCheck(n: ItemNode) {
    const all = new Set(this.selectedIds ?? []);
    const ids = this.flatten([n]).map(x => x.id);
    const allSelected = ids.every(id => all.has(id));
    ids.forEach(id => (allSelected ? all.delete(id) : all.add(id)));
    this.selectionChange.emit(Array.from(all));
  }

  onDisclosureKeydown(e: KeyboardEvent, n: ItemNode) {
    if (e.key === 'ArrowRight' && this.isCollapsed(n.id)) { e.preventDefault(); this.toggle(n.id); }
    if (e.key === 'ArrowLeft'  && !this.isCollapsed(n.id)) { e.preventDefault(); this.toggle(n.id); }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.toggle(n.id); }
  }

  private flatten(list: ItemNode[], acc: ItemNode[] = []): ItemNode[] {
    for (const n of list) {
      acc.push(n);
      if (n.children?.length) this.flatten(n.children, acc);
    }
    return acc;
  }
}


export type { ItemNode as ItemNodeAlias };
