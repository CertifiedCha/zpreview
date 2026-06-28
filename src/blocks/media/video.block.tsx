import { Video } from "lucide-react";
import type { BlockDefinition } from "../../types";
import { containerStyleGroup, defaultStylePresets, iconSize, makeBlock } from "../shared";

export const videoBlock: BlockDefinition = {
  type: "video",
  label: "Video",
  category: "multimedia",
  icon: <Video size={iconSize} />,
  defaultBlock: () =>
    makeBlock(
      "video",
      {
        videoSourceType: "upload",
        videoUrl: "",
        title: "Lesson video",
        caption: "",
      },
      { style: { minHeight: 360 } },
    ),
  preview: (_block, theme) => (
    <div className="rounded-2xl p-4 text-center" style={{ background: theme.bgLight }}>
      <Video className="mx-auto mb-2" size={28} style={{ color: theme.primary }} />
      <p className="text-xs font-bold text-zinc-700">Upload or embed video</p>
    </div>
  ),
  config: {
    content: [
      { section: "content", kind: "text", key: "title", label: "Video title" },
      {
        section: "content",
        kind: "select",
        key: "videoSourceType",
        label: "Video source",
        options: [
          { label: "Upload file", value: "upload" },
          { label: "YouTube", value: "youtube" },
          { label: "Direct link", value: "link" },
        ],
      },
      { section: "content", kind: "text", key: "videoUrl", label: "YouTube or video URL" },
      { section: "content", kind: "text", key: "caption", label: "Caption" },
      { section: "content", kind: "playbackRange", key: "youtubeStartSeconds", label: "Playback range", startKey: "youtubeStartSeconds", endKey: "youtubeEndSeconds", visibleWhen: (block) => block.content.videoSourceType === "youtube" },
      { section: "content", kind: "toggle", target: "settings", key: "youtubeAutoplay", label: "Autoplay", visibleWhen: (block) => block.content.videoSourceType === "youtube" },
      { section: "content", kind: "toggle", target: "settings", key: "youtubeMuted", label: "Start muted", visibleWhen: (block) => block.content.videoSourceType === "youtube" },
      { section: "content", kind: "toggle", target: "settings", key: "youtubeShowControls", label: "Show YouTube controls", defaultChecked: false, visibleWhen: (block) => block.content.videoSourceType === "youtube" },
      { section: "content", kind: "toggle", target: "settings", key: "youtubeAllowFullscreen", label: "Allow fullscreen", defaultChecked: true, visibleWhen: (block) => block.content.videoSourceType === "youtube" },
      { section: "content", kind: "toggle", target: "settings", key: "youtubeLoop", label: "Loop video", visibleWhen: (block) => block.content.videoSourceType === "youtube" },
      { section: "content", kind: "toggle", target: "settings", key: "youtubeCaptions", label: "Show captions by default", visibleWhen: (block) => block.content.videoSourceType === "youtube" },
      { section: "content", kind: "toggle", target: "settings", key: "youtubePlaysInline", label: "Play inline on mobile", defaultChecked: true, visibleWhen: (block) => block.content.videoSourceType === "youtube" },
    ],
    stylePresets: defaultStylePresets,
    styleGroups: [containerStyleGroup],
  },
};
