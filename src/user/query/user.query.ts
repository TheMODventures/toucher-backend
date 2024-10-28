import { ROLES } from 'src/common/constants';

export const fetchAllUsersQuery = (userId: string, search: string) => {
  return {
    $and: [
      { _id: { $ne: userId } },
      { role: ROLES.USER },
      {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }]
      }
    ]
  }
};
