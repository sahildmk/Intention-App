import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { CollectionItem, type Prisma } from "@prisma/client";
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
  getCollectionItems: publicProcedure.query(async ({ ctx }) => {
    const collection = (await ctx.prisma.collection.findFirst({
      where: {
        id: "clfs78n950000vosgtwna7gvl",
      },
      include: {
        collectionItems: {
          orderBy: {
            StartDateTime: "asc",
          },
        },
      },
    })) as CollectionWithItems;

    const result: CollectionItemDto[] = [];

    collection.collectionItems.forEach((collectionItem) => {
      result.push(CollectionItemToDto(collectionItem));
    });

    return result;
  }),

  updateCollectionItem: publicProcedure
    .input(z.object({ collectionItemId: z.string(), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      console.log(input.collectionItemId, input.content);

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
