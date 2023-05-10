const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate("savedBooks");
      }
      throw new AuthenticationError("You Need To Be Logged In");
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { book }, { user }) => {
      console.log("Context in saveBook resolver:", user);
      if (!user) {
        throw new Error("You Need To Be Logged In To Save A Book");
      }

      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: book } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      } catch (err) {
        console.log(err);
        throw new Error("Failed To Save Book");
      }
    },
    deleteBook: async (parent, { bookId }, { user }) => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId: bookId } } },
        { new: true }
      );
      if (!updatedUser) {
        throw new AuthenticationError("Couldn't Find A User With This ID");
      }
      return updatedUser;
    },
    login: async (parent, { email, username, password }) => {
      const user = await User.findOne({
        $or: [{ email }, { username }],
      });
      if (!user) {
        throw new Error("User not found");
      }
      const correctPassword = await bcrypt.compare(password, user.password);
      if (!correctPassword) {
        throw new AuthenticationError("Incorrect Password");
      }
      const token = signToken(user);
      return { token, user };
    },
  },
};

module.exports = resolvers;
