import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { CollectionItem, type Prisma } from "@prisma/client";

type CollectionWithItems = Prisma.CollectionGetPayload<{
  include: { collectionItems: true };
}>;

export type CollectionItemDTO = {
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

    const result: CollectionItemDTO[] = [];

    collection.collectionItems.forEach((val) => {
      result.push({
        id: val.id,
        collectionId: val.collectionId,
        userId: val.userId,
        content: val.content,
        startDateTime: val.StartDateTime.toISOString(),
        endDateTime: val.EndDateTime.toISOString(),
        createdDateTime: val.CreatedDateTime.toISOString(),
      });
    });

    return result;
  }),
});
