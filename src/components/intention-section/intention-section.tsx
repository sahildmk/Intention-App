import { useToast } from "@/hooks/ui/use-toast";
import { api } from "@/utils/api";
import moment from "moment";
import { useState, type ChangeEvent, useCallback, useEffect } from "react";
import Textarea from "../ui/textarea/textarea";
import TimePicker from "../ui/time-picker/time-picker";
import { type CollectionItemDto } from "@/server/api/routers/collections/collectionsRouter";

const IntentionSection: React.FC<{ collectionItems: CollectionItemDto[] }> = ({
  collectionItems,
}) => {
  const { toast } = useToast();

  const [firstItention, setFirstIntention] = useState(collectionItems.at(0));
  const [intention, setIntention] = useState(firstItention?.content ?? "");
  const [intentionUpdated, setIntentionUpdated] = useState(false);

  const currentMoment = moment();
  const currentDate = currentMoment.format("YYYY-MM-DD");

  const startOfCurrentTimeBlockString = `${currentDate}T${String(
    currentMoment.hour()
  ).padStart(2, "0")}:00:00`;

  const [currentIntentionStartTime, setCurrentIntentionStartTime] = useState(
    moment(firstItention?.startDateTime ?? startOfCurrentTimeBlockString)
  );

  const endTime = firstItention?.endDateTime
    ? moment(firstItention?.endDateTime)
    : moment(startOfCurrentTimeBlockString).add(1, "hour");

  const [currentIntentionEndTime, setCurrentIntentionEndTime] =
    useState(endTime);

  const setIntentionCallback = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setIntentionUpdated(true);
    setIntention(e.target.value);
  };

  const timeToLocalISOString = (time: string) => {
    return `${currentDate}T${time}:00`;
  };

  const setStartTimeCallback = (e: ChangeEvent<HTMLInputElement>) => {
    setIntentionUpdated(true);
    setCurrentIntentionStartTime(moment(timeToLocalISOString(e.target.value)));
  };

  const setEndTimeCallback = (e: ChangeEvent<HTMLInputElement>) => {
    setIntentionUpdated(true);
    setCurrentIntentionEndTime(moment(timeToLocalISOString(e.target.value)));
  };

  const createIntentionMut = api.collections.createCollectionItem.useMutation({
    onSuccess(data) {
      if (data.ok) setFirstIntention(data.value);
    },
  });
  const updateIntentionMut = api.collections.updateCollectionItem.useMutation();

  const updateIntentionCallback = useCallback(() => {
    if (!intentionUpdated) return;

    if (firstItention?.id) {
      console.log("➡️ Updating intention...");
      updateIntentionMut.mutate({
        collectionItemId: firstItention?.id,
        content: intention,
        startDateTime: currentIntentionStartTime.toISOString(),
        endDateTime: currentIntentionEndTime.toISOString(),
      });
      toast({
        description: "Intention Updated",
      });
    } else if (intention !== "") {
      console.log("🎆 Creating intention...");

      createIntentionMut.mutate({
        content: intention,
        startDateTime: currentIntentionStartTime.toISOString(),
        endDateTime: currentIntentionEndTime.toISOString(),
      });
      toast({
        description: "Intention Saved",
      });
    }
  }, [
    toast,
    intentionUpdated,
    firstItention?.id,
    intention,
    updateIntentionMut,
    currentIntentionStartTime,
    currentIntentionEndTime,
    createIntentionMut,
  ]);

  useEffect(() => {
    const timeout = setTimeout(updateIntentionCallback, 2000);

    return () => {
      clearTimeout(timeout);
      setIntentionUpdated(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intention, currentIntentionStartTime, currentIntentionEndTime]);

  return (
    <section className="w-full px-5 sm:px-10 md:w-fit">
      <Textarea
        value={intention}
        onChange={setIntentionCallback}
        placeholder="Set your intention"
      />

      <div className="time-picker text-md mt-2 flex gap-1 font-extralight text-zinc-700 dark:text-zinc-300 md:text-xl">
        <TimePicker
          value={currentIntentionStartTime.format("HH:mm")}
          onChange={setStartTimeCallback}
        />
        <div className="py-1">-</div>
        <TimePicker
          value={currentIntentionEndTime.format("HH:mm")}
          min={currentIntentionEndTime.format("HH:mm")}
          onChange={setEndTimeCallback}
        />
      </div>
    </section>
  );
};

export default IntentionSection;
