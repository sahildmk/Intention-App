import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { ProcessRequest, ProcessRequestAsync } from "@/utils/processRequest";
import { type CollectionItem, type Prisma } from "@prisma/client";
import { z } from "zod";

type CollectionWithItems = Prisma.CollectionGetPayload<{
  include: { collectionItems: true };
}>;

export type CollectionItemDto = {
  id: string;
  collectionId: string;
  userId: string | null;
  content: string;
  startDateTime: string;
  endDateTime: string;
  createdDateTime: string;
};

export const collectionsRouter = createTRPCRouter({
  getCollectionItems: protectedProcedure.query(async ({ ctx }) => {
    return await ProcessRequestAsync(async () => {
      const collectionItems = await ctx.prisma.collectionItem.findMany({
        where: {
          userId: ctx.session?.user?.id,
        },
        orderBy: {
          StartDateTime: "asc",
        },
      });

      const result: CollectionItemDto[] = [];

      collectionItems.forEach((collectionItem) => {
        result.push(CollectionItemToDto(collectionItem));
      });

      return result;
    });
  }),

  updateCollectionItem: protectedProcedure
    .input(z.object({ collectionItemId: z.string(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.collectionItem.update({
        data: {
          content: input.content,
        },
        where: {
          id: input.collectionItemId,
        },
      });

      return CollectionItemToDto(result);
    }),
});

function CollectionItemToDto(collectionItem: CollectionItem) {
  return {
    id: collectionItem.id,
    collectionId: collectionItem.collectionId,
    userId: collectionItem.userId,
    content: collectionItem.content,
    startDateTime: collectionItem.StartDateTime.toISOString(),
    endDateTime: collectionItem.EndDateTime.toISOString(),
    createdDateTime: collectionItem.CreatedDateTime.toISOString(),
  } satisfies CollectionItemDto;
}
