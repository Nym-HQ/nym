import { GraphQLError } from 'graphql';
// import { ValidationError } from 'yup'; // Removed
// import { AuthorizationError } from '~/lib/errors'; // Removed

export const addPost = async (_, { input }, context) => {
  try {
    const { prisma, viewer } = context;

    if (!viewer) {
      throw new GraphQLError('You must be logged in to create a post', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    // Validate input
    // TODO: Add proper validation without Yup or use another validation library

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
    throw new GraphQLError('Unable to add post: ' + error.message, {
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
  }
};