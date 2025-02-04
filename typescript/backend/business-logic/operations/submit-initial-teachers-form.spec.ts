import { pick } from 'lodash';
import { InitialTeacherForm, Teacher } from '../../../common/entities/teacher';
import { buildCountry } from '../../../test/builders/country';
import { buildLanguage } from '../../../test/builders/language';
import { buildTeacher } from '../../../test/builders/teacher';
import { expect } from '../../../test/utils/expectations';
import { stubFn, stubType } from '../../../test/utils/stubbing';
import { TaskNumber } from '../../common/entities/task';
import { CountriesRepository } from '../../repositories/countries-repository';
import { LanguagesRepository } from '../../repositories/languages-repository';
import { TeachersRepository } from '../../repositories/teachers-repository';
import { CompleteTeachersTask } from './complete-teachers-task';
import { GetTeacher } from './get-teacher';
import { submitInitialTeachersFormFactory } from './submit-initial-teachers-form';

describe('submitInitialTeachersForm', () => {
  const country = buildCountry();
  const language = buildLanguage();
  const teacher = buildTeacher();
  const update: InitialTeacherForm = {
    ...pick(buildTeacher(), ['profileImage', 'phoneNumber', 'city', 'streetAddress']),
    country: country.title,
    language: language.title,
  };
  const updatedTeacher: Teacher = {
    ...teacher,
    ...pick(update, ['profileImage', 'phoneNumber', 'city', 'streetAddress']),
    countryId: country._id,
    languageId: language._id,
  };

  const getTeachersRepository = (teacher: Teacher, returnedTeachersProfile: Teacher) =>
    stubType<TeachersRepository>((stub) => {
      stub.updateTeacher.resolves(returnedTeachersProfile);
    });
  const getCountriesRepository = (country) =>
    stubType<CountriesRepository>((stub) => {
      stub.fetchCountryByTitleOrThrow.resolves(country);
    });
  const getLanguagesRepository = (language) =>
    stubType<LanguagesRepository>((stub) => {
      stub.fetchLanguageByTitleOrThrow.resolves(language);
    });
  const getGetTeacher = (teacher: Teacher) => stubFn<GetTeacher>().resolves(teacher);
  const getCompleteTeachersTask = () => stubFn<CompleteTeachersTask>().resolves();
  const buildTestContext = ({
    teachersRepository = getTeachersRepository(teacher, updatedTeacher),
    countriesRepository = getCountriesRepository(country),
    languagesRepository = getLanguagesRepository(language),
    getTeacher = getGetTeacher(teacher),
    completeTeachersTask = getCompleteTeachersTask(),
  } = {}) => ({
    teachersRepository,
    languagesRepository,
    getTeacher,
    completeTeachersTask,
    submitInitialTeachersForm: submitInitialTeachersFormFactory(
      teachersRepository,
      countriesRepository,
      languagesRepository,
      getTeacher,
      completeTeachersTask
    ),
  });

  it('should update, return current teacher and complete task', async () => {
    const {
      teachersRepository,
      languagesRepository,
      getTeacher,
      completeTeachersTask,
      submitInitialTeachersForm,
    } = buildTestContext();

    expect(await submitInitialTeachersForm(update)).to.eql(updatedTeacher);
    expect(getTeacher).calledOnceWithExactly({ throwOnNotFound: true });
    expect(languagesRepository.fetchLanguageByTitleOrThrow).calledOnceWithExactly(language.title);
    expect(teachersRepository.updateTeacher).calledOnceWithExactly(updatedTeacher);
    expect(completeTeachersTask).calledOnceWithExactly(TaskNumber.initialProfileForm);
  });

  context('on update validation failed', () => {
    const update = { phoneNumber: '11', city: 'a' } as InitialTeacherForm;

    it('should return human readable error', async () => {
      const { getTeacher, submitInitialTeachersForm } = buildTestContext();
      await expect(submitInitialTeachersForm(update)).rejectedWith(/field is required/);
      expect(getTeacher).not.called;
    });
  });
});
