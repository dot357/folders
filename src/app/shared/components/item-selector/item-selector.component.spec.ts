import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemSelectorComponent, ItemNode } from './item-selector.component';

const tree: ItemNode[] = [
  {
    id: 1,
    label: 'Audio',
    children: [
      {
        id: 2,
        label: 'Speakers',
        children: [
          { id: 3, label: 'Active' },
          { id: 4, label: 'Speaker item 1' }
        ]
      },
      { id: 5, label: 'Audio item 1' }
    ]
  }
];

describe('ItemSelectorComponent', () => {
  let fixture: ComponentFixture<ItemSelectorComponent>;
  let comp: ItemSelectorComponent;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemSelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemSelectorComponent);
    comp = fixture.componentInstance;
    el = fixture.nativeElement as HTMLElement;

    comp.nodes = tree;
    comp.selectedIds = [];
    fixture.detectChanges();
  });

  function rowByLabel(text: string): HTMLElement | undefined {
    const rows = Array.from(el.querySelectorAll('.tree-row')) as HTMLElement[];
    return rows.find(r => r.querySelector('.label')?.textContent?.trim() === text);
  }

  it('renders labels', () => {
    const labels = Array.from(el.querySelectorAll('.label')).map(n => n.textContent?.trim());
    expect(labels).toContain('Audio');
    expect(labels).toContain('Speakers');
    expect(labels).toContain('Active');
    expect(labels).toContain('Speaker item 1');
    expect(labels).toContain('Audio item 1');
  });

  it('collapses and expands via chevron', () => {
    const audioRow = rowByLabel('Audio')!;
    const chev = audioRow.querySelector('button.chev') as HTMLButtonElement;
    expect(chev).toBeTruthy();

    expect(rowByLabel('Speakers')).toBeTruthy(); // visible initially
    chev.click();
    fixture.detectChanges();

    expect(rowByLabel('Speakers')).toBeUndefined(); // collapsed
    chev.click();
    fixture.detectChanges();

    expect(rowByLabel('Speakers')).toBeTruthy(); // expanded again
  });

  it('emits selectionChange when a folder is toggled (cascade)', (done) => {
    const speakersRow = rowByLabel('Speakers')!;
    const cb = speakersRow.querySelector('input[type="checkbox"]') as HTMLInputElement;

    comp.selectionChange.subscribe(ids => {
      const sorted = [...ids].sort((a, b) => a - b);
      expect(sorted).toEqual([2, 3, 4]); // Speakers + its descendants
      done();
    });

    cb.dispatchEvent(new Event('change'));
  });

  it('sets indeterminate when some descendants are selected', () => {
    comp.selectedIds = [4]; // only "Speaker item 1" selected
    fixture.detectChanges();

    const speakersRow = rowByLabel('Speakers')!;
    const cb = speakersRow.querySelector('input[type="checkbox"]') as HTMLInputElement;

    // DOM property reflects indeterminate state
    expect(cb.indeterminate).toBeTrue();
  });

  it('keyboard toggles expand/collapse', () => {
    const speakersRow = rowByLabel('Speakers')!;
    const chev = speakersRow.parentElement!.querySelector('.row-right .chev') as HTMLButtonElement;

    // collapse Speakers with ArrowLeft only if open; ensure open first
    if (chev.getAttribute('aria-expanded') !== 'false') {
      chev.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      fixture.detectChanges();
      expect(chev.getAttribute('aria-expanded')).toBe('false');
    }

    // expand with ArrowRight
    chev.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(chev.getAttribute('aria-expanded')).toBe('true');
  });
});
