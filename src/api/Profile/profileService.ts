import { ProfileModel } from ".";
import { UserModel } from "../User";
export class ProfileService {

    /**
     * Gets the user profile
     * @param {string} username the username to look up
     */
    public getUserProfile = async (username: string) => {
        const user = await UserModel.findOne({ where: { username } });
        if (user) {
            const profile = await user.getProfile({ attributes: { exclude: ["id", "user_id"] } });
            return (profile) ? profile : null;
        }
        return `User with ${username} not found`;
    }
    /**
     * Gets the user profile
     * @param {string} phone_number the username to look up
     */
    public getAppProfile = async (phone_number: string) => {
        const user = await UserModel.findOne({ where: { phone_number } });
        if (user) {
            const profile = await user.getProfile({ attributes: { exclude: ["id", "user_id"] } });
            return (profile) ? profile : null;
        }
        return `User with ${phone_number} not found`;
    }
    /**
     * Updates a user profile
     *
     * @param {Object} user the current user
     * @param {Object} profile the profile data to save
     * @returns {Object} the updated profile
     */
    public editProfile = async (user: any, photo: any, profile: any) => {
        const hasProfile: boolean = (await user.getProfile()) ? true : false;
        profile.profile_picture_url = photo.location;
        if (hasProfile) {
            return ProfileModel.update(profile, { where: { user_id: user.id } }).then(() => {
                return this.getUserProfile(user.username);
            });
        } else {
            const saved = await ProfileModel.create(profile);
            if (saved && user.setProfile(saved)) {
                return this.getUserProfile(user.username);
            }
        }
    }

    /**
     * Saves uploaded profile photo
     *
     * @param {Object} user the current user
     * @param {Object} photo the uploaded photo with properties
     * @returns {Object} the updated profile data
     */
    public saveProfilePhoto = async (user: any, photo: any) => {
        const profileData = {
            profile_picture_url: photo.location,
        };
        const hasProfile: boolean = (await user.getProfile()) ? true : false;

        if (hasProfile) {
            return ProfileModel.update(profileData, { where: { user_id: user.id } }).then(() => {
                return this.getUserProfile(user.username);
            });
        } else {
            const saved = await ProfileModel.create(profileData);
            if (saved && user.setProfile(saved)) {
                return this.getUserProfile(user.username);
            }
        }
    }

}
