const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { authMiddleware, signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.user) throw new AuthenticationError("You Need To Be Logged In First");
      return User.findById(context.user._id).populate("savedBooks");
    },
  },

  Mutation: {
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user || !(await user.isCorrectPassword(password))) {
        throw new AuthenticationError("Email Or Password Is Incorrect");
      }
      return { token: signToken(user), user };
    },

    addUser: async (_, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      return { token: signToken(user), user };
    },

    saveBook: async (_, { bookData }, context) => {
      if (!context.user) throw new AuthenticationError("Please Log In To Save Your Book");
      return await User.findByIdAndUpdate(
        context.user._id,
        { $push: { savedBooks: bookData } },
        { new: true, runValidators: true }
      );
    },

    removeBook: async (_, { bookId }, context) => {
      if (!context.user)
        throw new AuthenticationError("Please Log In To Remove Books From Your Collection");
      return await User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      ).populate("savedBooks");
    },
  },
};

module.exports = resolvers;
