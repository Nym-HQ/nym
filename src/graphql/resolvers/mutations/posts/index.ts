import { GraphQLError } from 'graphql';
import { z } from 'zod';

const addPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  // Add other fields and validations as necessary
});

export const addPost = async (_, { input }, context) => {
  try {
    const { prisma, viewer } = context;

    if (!viewer) {
      throw new GraphQLError('You must be logged in to create a post', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    // Validate input
    const validatedInput = addPostSchema.parse(input);

    const newPost = await prisma.post.create({
      data: {
        title: validatedInput.title,
        content: validatedInput.content,
        authorId: viewer.id,
        // Add other fields as necessary
      },
    });

    return newPost;
  } catch (error) {
    console.error('Error adding post:', error);
    if (error instanceof z.ZodError) {
      throw new GraphQLError('Invalid input data', {
        extensions: { code: 'BAD_USER_INPUT', invalidArgs: error.errors },
      });
    }
    throw new GraphQLError('Unable to add post: ' + error.message, {
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
  }
};