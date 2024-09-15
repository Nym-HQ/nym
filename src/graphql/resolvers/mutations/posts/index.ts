import { GraphQLError } from 'graphql';
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
      throw new GraphQLError('Invalid input data', {
        extensions: { code: 'BAD_USER_INPUT', invalidArgs: error.errors },
      });
    } else if (error instanceof AuthorizationError) {
      throw new GraphQLError('Not authorized to add post', {
        extensions: { code: 'FORBIDDEN' },
      });
    } else {
      throw new GraphQLError('Unable to add post: ' + error.message, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  }
};