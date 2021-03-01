import { ResolverMap } from "../../types/graphql-utils";
import * as bcrypt from "bcryptjs";
import * as yup from "yup";
import { User } from "../../entity/User";
import { formatYupError } from "../../utils/formatYupError";
import { createConfirmEmailLink } from "../../utils/createConfirmEmailLink";

const schema = yup.object().shape({
  firstName: yup.string().min(1).max(255).required(),
  lastName: yup.string().min(1).max(255).required(),
  email: yup.string().min(3).max(255).email().required(),
  password: yup.string().min(2).max(255).required(),
});

export const resolvers: ResolverMap = {
  Mutation: {
    register: async (
      _: any,
      args: GQL.IRegisterOnMutationArguments,
      { redis, url }
    ) => {
      try {
        await schema.validate(args, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }

      const { firstName, lastName, email, password } = args;
      const userExists = await User.findOne({
        where: { email },
        select: ["id"],
      });

      if (userExists) {
        return [
          {
            path: "email",
            message: "already exists",
          },
        ];
      }

      const hashedPass = await bcrypt.hash(password, 10);
      const user = User.create({
        firstName,
        lastName,
        email,
        password: hashedPass,
      });

      await user.save();

      const link = createConfirmEmailLink(url, user.id, redis);
      console.log(link);
      return null;
    },
  },
};

export default resolvers;
