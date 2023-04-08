import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import * as CollectionsRepository from "@/server/repository/collectionsRepository";
import { ProcessRequestAsync } from "@/utils/processRequest";
import { type CollectionItem } from "@prisma/client";
import { z } from "zod";

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
      const collectionItems =
        await CollectionsRepository.GetAllCollectionItemsByUserId(ctx);

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
      return await ProcessRequestAsync(async () => {
        const result = await CollectionsRepository.UpdateCollectionItemContent(
          ctx,
          input.collectionItemId,
          input.content
        );

        return CollectionItemToDto(result);
      });
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
