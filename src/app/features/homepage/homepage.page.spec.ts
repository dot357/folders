import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { HomepagePage } from './homepage.page';
import { ResponseService, ResponseData } from '../../core/http/response.service';


const mockResponse: ResponseData = {
  folders: {
    columns: ['id', 'title', 'parent_id'],
    data: [
      [1, 'Audio', null],
      [4, 'Speakers', 1],
      [8, 'Rigging', null],
      [10, 'Active speakers', 4],
      [2, 'Passive speakers', 4],
      [6, 'Truss', 8],
    ],
  },
  items: {
    columns: ['id', 'title', 'folder_id'],
    data: [
      [3, 'Passive Speakers Item 1', 2],
      [8, 'Truss item 2', 6],
      [7, 'Speaker item 1', 4],
      [5, 'Audio item 1', 1],
      [1, 'Active Speakers Item 1', 10],
      [4, 'Speaker item 2', 4],
      [6, 'Truss item 1', 6],
    ],
  },
};

describe('HomepagePage', () => {
  let fixture: ComponentFixture<HomepagePage>;
  let component: HomepagePage;
  let response$: Subject<ResponseData>;
  let getResponseSpy: jasmine.Spy;

  beforeEach(async () => {
    response$ = new Subject<ResponseData>();

    await TestBed.configureTestingModule({
      imports: [HomepagePage], 
      providers: [
        {
          provide: ResponseService,
          useValue: {
            getResponse: () => response$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomepagePage);
    component = fixture.componentInstance;
  });

  it('shows loading until data arrives, then builds tree', fakeAsync(() => {
    fixture.detectChanges();             
    expect(component.isLoading()).toBeTrue();

    response$.next(mockResponse);
    response$.complete();
    tick();                                 

    expect(component.isLoading()).toBeFalse();
    expect(component.error()).toBeNull();

    const roots = component.tree();
    expect(roots.length).toBeGreaterThan(0);

    const rootLabels = roots.map(n => n.label);
    expect(rootLabels).toContain('Audio');
    expect(rootLabels).toContain('Rigging');
  }));

  it('sorts folders/items alphabetically with folders first', fakeAsync(() => {
    fixture.detectChanges();

    response$.next(mockResponse);
    response$.complete();
    tick();

    const roots = component.tree();
    const audio = roots.find(r => r.label === 'Audio')!;
    expect(audio).toBeTruthy();

    const childLabels = (audio.children ?? []).map(c => c.label);
    const foldersFirst = ['Speakers']; 
    const itemsAfter = ['Audio item 1'];


    expect(childLabels.slice(0, foldersFirst.length)).toEqual(foldersFirst);


    expect(childLabels).toContain('Audio item 1');

    const speakers = audio.children!.find(c => c.label === 'Speakers')!;
    const speakersChildren = (speakers.children ?? []).map(c => c.label);


    const expectedFolderNames = ['Active speakers', 'Passive speakers'].sort((a,b)=>a.localeCompare(b));
    const expectedItemNames = ['Speaker item 1', 'Speaker item 2'].sort((a,b)=>a.localeCompare(b));

    expect(speakersChildren.slice(0, 2)).toEqual(expectedFolderNames);

    const leafNames = speakersChildren.slice(2).sort((a,b)=>a.localeCompare(b));
    expect(leafNames).toEqual(expectedItemNames);
  }));

  it('handles API error', fakeAsync(() => {
    const svc = TestBed.inject(ResponseService);
    getResponseSpy = spyOn(svc, 'getResponse').and.returnValue(throwError(() => new Error('boom')));

    fixture.detectChanges();
    tick();

    expect(component.isLoading()).toBeFalse();
    expect(component.error()).toBe('boom');
    expect(component.tree().length).toBe(0);
  }));

  it('updates selection via onSelectionChange and clears', () => {
    component.onSelectionChange([1, 2, 3]);
    expect(component.selected()).toEqual([1, 2, 3]);

    component.clear();
    expect(component.selected()).toEqual([]);
  });
});
