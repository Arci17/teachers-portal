import { Externals } from '../context/production-context';
import { TeachersProfile } from '../types/teachers-profile';
import { findSingleRecord } from '../utils/database-queries';
import { withLogger } from '../utils/logger';

const TEACHERS_PROFILE_COLLECTION = 'TeachersProfile';

export class TeachersProfileRepository {
  constructor(private readonly externals: Externals) {}

  public fetchTeachersProfileByEmail(email: string): Promise<TeachersProfile | undefined> {
    return withLogger(
      `fetchTeachersProfileByEmail ${email}`,
      findSingleRecord(
        this.externals.wixData
          .query(TEACHERS_PROFILE_COLLECTION)
          .eq('email', email)
          .limit(1)
          .find({ suppressAuth: true })
      )
    );
  }

  public async updateTeachersProfile(teachersProfile: TeachersProfile): Promise<TeachersProfile> {
    return withLogger(
      `updateTeachersProfile ${teachersProfile.email}`,
      this.externals.wixData.update(TEACHERS_PROFILE_COLLECTION, teachersProfile, {
        suppressAuth: true,
      })
    );
  }

  public async insertTeachersProfile(teachersProfile: TeachersProfile): Promise<TeachersProfile> {
    return withLogger(
      `insertTeachersProfile ${teachersProfile.email}`,
      this.externals.wixData.insert(TEACHERS_PROFILE_COLLECTION, teachersProfile, {
        suppressAuth: true,
      })
    );
  }
}
