import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import * as CollectionsRepository from "@/server/repository/collectionsRepository";
import { ProcessRequestAsync } from "@/utils/processRequest";
import { type CollectionItem } from "@prisma/client";
import moment from "moment";
import { z } from "zod";

export type CollectionItemDto = {
  id: string;
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

  createCollectionItem: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        startDateTime: z.string().datetime(),
        endDateTime: z.string().datetime(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ProcessRequestAsync(async () => {
        const result = await CollectionsRepository.CreateCollectionItem(
          ctx,
          input.content,
          moment(input.startDateTime).toDate(),
          moment(input.endDateTime).toDate()
        );

        return result;
      });
    }),
});

function CollectionItemToDto(collectionItem: CollectionItem) {
  return {
    id: collectionItem.id,
    userId: collectionItem.userId,
    content: collectionItem.content,
    startDateTime: collectionItem.StartDateTime.toISOString(),
    endDateTime: collectionItem.EndDateTime.toISOString(),
    createdDateTime: collectionItem.CreatedDateTime.toISOString(),
  } satisfies CollectionItemDto;
}
