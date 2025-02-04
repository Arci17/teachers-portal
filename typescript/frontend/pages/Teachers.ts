import { debounce } from 'lodash';
import {
  AccountStatus,
  AccountStatuses,
  Teacher,
  TeacherLevel,
} from 'public/common/entities/teacher';
import { forCurrentTeacher } from 'public/for-current-teacher';
import { setupInputChangeHandlers } from 'public/inputs-location';
import { getFilter } from 'public/wix-filter';
import { loadFirstDatasetPage } from 'public/wix-utils';
import wixLocation from 'wix-location';

type TeachersFilter = {
  fullName: string;
  city: string;
  level: string;
};
type TeachersFilterKey = keyof TeachersFilter;

const TEXT_INPUTS: TeachersFilterKey[] = ['fullName', 'city'];
const DROPDOWNS: TeachersFilterKey[] = ['level'];

let state: {
  fieldValues: TeachersFilter;
  teacherLevels: TeacherLevel[];
  visibleAccountStatusIds: string[];
};

forCurrentTeacher(async () => {
  const [teacherLevels, accountStatuses] = await Promise.all([
    loadFirstDatasetPage<TeacherLevel>($w('#TeacherLevelsDataset')),
    loadFirstDatasetPage<AccountStatus>($w('#AccountStatusesDataset')),
  ]);
  state = {
    teacherLevels,
    visibleAccountStatusIds: accountStatuses
      .filter(({ title }) => title !== AccountStatuses.NotATeacher)
      .map(({ _id }) => _id),
    fieldValues: wixLocation.query,
  };
  await updateTeachersFilter();
  setupInputOnChange();

  $w('#TeacherLevelsDataset').onReady(() => {
    const $dropdown = $w('#level' as 'Dropdown');
    $dropdown.options = [{ label: 'All', value: '' }, ...$dropdown.options];
  });

  $w('#teachersRepeater' as 'Repeater').onItemReady(($item, teacher: Teacher) => {
    $item('#teachersProfileImage' as 'Image').onClick(() => redirectToTeacher(teacher));
    $item('#teachersName' as 'Text').onClick(() => redirectToTeacher(teacher));
  });
});

function setupInputOnChange() {
  setupInputChangeHandlers(TEXT_INPUTS, DROPDOWNS);

  TEXT_INPUTS.forEach((field) => {
    const $input = $w(`#${field}` as 'TextInput');
    $input.value = state.fieldValues[field];
    $input.onInput(debounce((event: $w.Event) => onInputChange(field, event), 500));
  });

  DROPDOWNS.forEach((field) => {
    const $dropdown = $w(`#${field}` as 'Dropdown');
    $dropdown.value = state.fieldValues[field];
    $dropdown.onChange((event: $w.Event) => onInputChange(field, event));
  });
}

async function onInputChange(field: string, event: $w.Event): Promise<void> {
  state.fieldValues[field] = event.target.value;
  updateTeachersFilter();
}

async function updateTeachersFilter() {
  const values = state.fieldValues;
  const levelId =
    values.level && state.teacherLevels.find(({ title }) => title === values.level)?._id;

  const datasetFilter = getFilter([
    [values.fullName, (filter) => filter.contains('fullName', values.fullName)],
    [values.city, (filter) => filter.contains('city', values.city)],
    [levelId, (filter) => filter.eq('levelId', levelId)],
    [
      state.visibleAccountStatusIds,
      (filter) => filter.hasSome('statusId', state.visibleAccountStatusIds),
    ],
  ]);

  await $w('#TeachersDataset').setFilter(datasetFilter);

  const $teachersRepeater = $w('#teachersRepeater' as 'Repeater');
  const $loadMoreButton = $w('#loadMoreButton' as 'Button');
  const $teachersEmptyState = $w('#teachersEmptyState' as 'Container');
  const $TeachersDataset = $w('#TeachersDataset');

  $TeachersDataset.onReady(() => {
    if ($TeachersDataset.getCurrentItem()) {
      $teachersRepeater.expand();
      $loadMoreButton.expand();
      $teachersEmptyState.collapse();
    } else {
      $teachersRepeater.collapse();
      $loadMoreButton.collapse();
      $teachersEmptyState.expand();
    }
  });
}

function redirectToTeacher(teacher: Teacher) {
  const { slug } = teacher;
  wixLocation.to(`/teacher/${slug}`);
}
