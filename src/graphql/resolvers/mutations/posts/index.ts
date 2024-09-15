import { UserInputError, ForbiddenError, ApolloError } from 'apollo-server-micro';
import { ValidationError } from 'yup';
import { AuthorizationError } from '~/lib/errors';

export const addPost = async (_, { input }, context) => {
  try {
    const { prisma, viewer } = context;

    if (!viewer) {
      throw new AuthorizationError('You must be logged in to create a post');
    }

    // Validate input
    // TODO: Add proper validation using Yup or similar

    const newPost = await prisma.post.create({
      data: {
        title: input.title,
        content: input.content,
        authorId: viewer.id,
        // Add other fields as necessary
      },
    });

    return newPost;
  } catch (error) {
    console.error('Error adding post:', error);
    if (error instanceof ValidationError) {
      throw new UserInputError('Invalid input data', { invalidArgs: error.errors });
    } else if (error instanceof AuthorizationError) {
      throw new ForbiddenError('Not authorized to add post');
    } else {
      throw new ApolloError('Unable to add post: ' + error.message, 'INTERNAL_SERVER_ERROR');
    }
  }
};