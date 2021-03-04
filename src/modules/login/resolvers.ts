import * as bcrypt from "bcryptjs";
import * as yup from "yup";

import { User } from "../../entity/User";
import { ResolverMap } from "../../types/graphql-utils";
import { formatYupError } from "../../utils/formatYupError";

const errorResponse = [
  {
    path: "email",
    message: "Incorrect email/password", // return ambiguous error message, so hackers cannot guess who is/isn't in the database.
  },
];

const schema = yup.object().shape({
  email: yup.string().min(3).max(255).email().required(),
  password: yup.string().min(2).max(255).required(),
});

export const resolvers: ResolverMap = {
  Mutation: {
    login: async (_: any, args: GQL.ILoginOnMutationArguments, { session }) => {
      try {
        await schema.validate(args, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }

      const { email, password } = args;

      const user = await User.findOne({ where: { email } });

      if (!user) {
        return errorResponse;
      }

      // if (!user.confirmed) {
      //   return [
      //     {
      //       path: "email",
      //       message: "unconfirmed email",
      //     },
      //   ];
      // }

      if (!(await bcrypt.compare(password, user.password))) {
        return errorResponse;
      }

      // login user
      session.userId = user.id;

      return null; // return no errors
    },
  },
};

export default resolvers;
