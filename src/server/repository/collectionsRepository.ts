import moment from "moment";
import { type AuthedContext } from "../api/trpc";

export const GetAllCollectionItemsByUserId = async (ctx: AuthedContext) => {
  return await ctx.prisma.collectionItem.findMany({
    where: {
      userId: ctx.session?.user?.id,
    },
    orderBy: {
      StartDateTime: "asc",
    },
  });
};

export const UpdateCollectionItemContent = async (
  ctx: AuthedContext,
  collectionItemId: string,
  content: string
) => {
  return await ctx.prisma.collectionItem.update({
    data: {
      content: content,
    },
    where: {
      id: collectionItemId,
    },
  });
};

export const CreateCollectionItem = async (
  ctx: AuthedContext,
  content: string,
  startDateTime: Date,
  endDateTime: Date
) => {
  return await ctx.prisma.collectionItem.create({
    data: {
      content: content,
      StartDateTime: startDateTime,
      EndDateTime: endDateTime,
      userId: ctx.session?.user.id,
      CreatedDateTime: moment().toDate(),
    },
  });
};
