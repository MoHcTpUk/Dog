import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { MainLayout } from "@app/layouts/MainLayout";
import { platformUtils } from "@shared/hooks";
import { Icon, Text, Textarea, Button } from "@shared/ui";

export const FeedbackPage: React.FC = () => {
  const history = useHistory();
  const [notificationCount] = useState(2);
  const [message, setMessage] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);

  const handleNotificationClick = () => {
    history.push("/notifications");
  };

  const handleBack = () => {
    history.goBack();
  };

  const handleImageCapture = async () => {
    const image = await platformUtils.media.pickImage();
    if (image) {
      setScreenshots([...screenshots, image]);
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    console.log("Feedback:", { message, screenshots });
  };

  return (
    <MainLayout withFooter>
      <div className="self-stretch flex flex-col justify-start items-start w-full">
        <div className="self-stretch px-3 py-5 flex flex-col justify-start items-start gap-8">
          <div className="self-stretch h-14 inline-flex justify-start items-center gap-3.5">
            <div
              className="p-2 -rotate-90 bg-white rounded-full shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)] inline-flex flex-col justify-center items-center gap-2.5 overflow-hidden cursor-pointer"
              onClick={handleBack}
            >
              <div className="size-6 relative rotate-90 overflow-hidden">
                <Icon name="arrow-left" size={24} />
              </div>
            </div>
            <Text
              variant="bold-24"
              color="primary"
              className="flex-1 leading-6"
            >
              Обратная связь
            </Text>
            <div
              className="relative cursor-pointer"
              onClick={handleNotificationClick}
            >
              <div className="p-3 -rotate-90 bg-white rounded-full shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)] flex flex-col justify-center items-center gap-2.5 overflow-hidden">
                <div className="rotate-90">
                  <Icon name="bell" size={24} />
                </div>
              </div>
              {notificationCount > 0 && (
                <div className="absolute min-w-5 px-1.5 py-0.5 left-[29px] top-[-9px] bg-pink-300 rounded-full flex flex-col justify-center items-center gap-2.5">
                  <Text variant="medium-14" color="white">
                    {notificationCount}
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="self-stretch p-5 inline-flex flex-col justify-start items-start gap-8 w-full">
          <div className="self-stretch p-5 bg-zinc-100 rounded-2xl outline outline-1 outline-offset-[-1px] outline-slate-200 inline-flex justify-start items-center gap-3">
            <Text
              variant="regular-16"
              color="primary"
              className="flex-1 leading-5"
            >
              Если что-то не работает, непонятно или если есть идея, как сделать
              лучше
            </Text>
          </div>

          <div className="self-stretch flex flex-col justify-start items-start gap-8">
            <div className="self-stretch flex flex-col justify-start items-center gap-3.5">
              <Text
                variant="medium-16"
                color="primary"
                className="self-stretch"
              >
                Напишите команде
              </Text>
              <div className="self-stretch h-28 p-5 bg-white rounded-2xl flex flex-col justify-start items-center gap-5 overflow-hidden">
                <Textarea
                  placeholder="Сообщение"
                  value={message}
                  onInput={setMessage}
                  rows={3}
                  disableWrapper={true}
                />
              </div>
            </div>

            <div className="self-stretch flex flex-col justify-start items-start gap-3.5">
              <Text
                variant="medium-16"
                color="primary"
                className="self-stretch"
              >
                Добавьте скрин
              </Text>
              <div className="self-stretch inline-flex justify-start items-start gap-1 flex-wrap">
                <div
                  className="size-44 px-5 py-6 bg-white rounded-3xl inline-flex flex-col justify-center items-center gap-5 overflow-hidden cursor-pointer"
                  onClick={handleImageCapture}
                >
                  <Icon name="camera" size={24} />
                </div>
                {screenshots.map((screenshot, index) => (
                  <div
                    key={index}
                    className="size-44 relative rounded-3xl overflow-hidden"
                  >
                    <img
                      src={screenshot}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute top-2 right-2 p-2 bg-white/60 rounded-full cursor-pointer"
                      onClick={() => handleRemoveScreenshot(index)}
                    >
                      <Icon name="cross" size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button variant="primary" size="L" fullWidth onClick={handleSubmit}>
            Отправить
          </Button>
        </div>
      </div>

    </MainLayout>
  );
};
