import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { type Prisma } from "@prisma/client";

type CollectionWithItems = Prisma.CollectionGetPayload<{
  include: { collectionItems: true };
}>;

export const collectionsRouter = createTRPCRouter({
  getCollectionItems: publicProcedure.query(async ({ ctx }) => {
    const collection = (await ctx.prisma.collection.findFirst({
      where: {
        id: "1",
      },
      include: {
        collectionItems: true,
      },
    })) as CollectionWithItems;

    return collection.collectionItems;
  }),
});
