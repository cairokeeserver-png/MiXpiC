
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

const IconBase: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        {children}
    </svg>
);

export const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="32" cy="32" r="30" fill="url(#grad)" />
        <path d="M20 32L28 40L44 24" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <defs><linearGradient id="grad" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#3b82f6" /><stop offset="1" stopColor="#8b5cf6" /></linearGradient></defs>
    </svg>
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></IconBase>
);

export const UndoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></IconBase>
);

export const RedoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" /></IconBase>
);

export const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><circle cx="12" cy="12" r="3" /></IconBase>
);

export const BullseyeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /></IconBase>
);

export const PaletteIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.475 2.118A2.25 2.25 0 01.879 16.5a3 3 0 014.242-4.242 3 3 0 004.242 0 3 3 0 000-4.242 3 3 0 01-4.242-4.242 3 3 0 014.242 0 3 3 0 010 4.242 3 3 0 004.242 4.242 3 3 0 005.78-1.128 2.25 2.25 0 012.475-2.118 2.25 2.25 0 011.5 3.5a3 3 0 01-4.242 4.242 3 3 0 00-4.242 0 3 3 0 000 4.242z" /></IconBase>
);

export const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></IconBase>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" /></IconBase>
);

export const CropIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5M3.75 16.5V18A2.25 2.25 0 006 20.25h1.5" /></IconBase>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></IconBase>
);

export const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></IconBase>
);

export const BrainIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6c0-3.314-2.686-6-6-6s-6 2.686-6 6a6 6 0 006 6zM12 15a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" /></IconBase>
);

export const PlusCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></IconBase>
);

export const StudioIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><circle cx="12" cy="12.75" r="4.5" /></IconBase>
);

export const HairIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6.331 4.542c.86-.502 1.834-.823 2.865-.941a10.482 10.482 0 015.608 0c1.03.118 2.004.439 2.865.941m-11.338 0a48.337 48.337 0 00-2.034 9.2c-.064.311-.097.625-.097.941 0 1.24.23 2.438.66 3.558m14.132-13.7a48.337 48.337 0 012.034 9.2c.064.311.097.625.097.941 0 1.24-.23 2.438-.66 3.558M17.669 4.542A48.272 48.272 0 0012 4.093a48.272 48.272 0 00-5.669.449" /></IconBase>
);

export const ColorSwatchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072" /></IconBase>
);

export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></IconBase>
);

export const AudioSparkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6c0-3.314-2.686-6-6-6s-6 2.686-6 6a6 6 0 006 6zM12 15a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM3 12h3m12 0h3M12 3v3m0 12v3" /></IconBase>
);

export const EyeSparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><circle cx="12" cy="12" r="3" /><path strokeLinecap="round" strokeLinejoin="round" d="M19 4l.5.5m0 0l.5.5m-.5-.5l.5-.5m-.5.5l-.5.5" /></IconBase>
);

export const PortraitIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></IconBase>
);

export const EraserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></IconBase>
);

export const BackgroundRemovalIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></IconBase>
);

export const RotateLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></IconBase>
);

export const RotateRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M7.977 14.652H2.985v.001m18.03-10.297v4.992m0 0h-4.992m4.993 0l-3.181-3.183a8.25 8.25 0 00-13.803 3.7M19.969 14.135a8.25 8.25 0 01-13.803 3.7l-3.181-3.182m0 4.991v-4.99" /></IconBase>
);

export const ResetIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></IconBase>
);

export const StackIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M1.5 6.375L12.75 1.5l11.25 4.875v11.25L12.75 22.5 1.5 17.625V6.375z" /><path strokeLinecap="round" strokeLinejoin="round" d="M1.5 6.375l11.25 4.875 11.25-4.875" /><path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12l11.25 4.875L24 12" /><path strokeLinecap="round" strokeLinejoin="round" d="M1.5 17.625l11.25 4.875 11.25-4.875" /></IconBase>
);

export const MagicWandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" /></IconBase>
);

export const ColorizeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.475 2.118A2.25 2.25 0 01.879 16.5a3 3 0 014.242-4.242 3 3 0 004.242 0 3 3 0 000-4.242 3 3 0 01-4.242-4.242 3 3 0 014.242 0 3 3 0 010 4.242 3 3 0 004.242 4.242 3 3 0 005.78-1.128 2.25 2.25 0 012.475-2.118 2.25 2.25 0 011.5 3.5a3 3 0 01-4.242 4.242 3 3 0 00-4.242 0 3 3 0 000 4.242z" /></IconBase>
);

export const EyedropperIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.333a4.5 4.5 0 01-1.318 3.182L10.333 19.614a4.5 4.5 0 01-6.364 0 4.5 4.5 0 010-6.364L14.061 3.159a4.5 4.5 0 016.364 0 4.5 4.5 0 011.325 3.174z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 11.25l1.5 1.5m-3-3l1.5 1.5" /></IconBase>
);

export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></IconBase>
);

export const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></IconBase>
);

export const DashCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></IconBase>
);

export const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></IconBase>
);

export const AvatarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l.75.75m0 0l.75.75m-.75-.75l.75-.75m-.75.75l-.75.75" />
    </IconBase>
);

export const TypeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21V3m8 4.5h-13M18 18h-3" />
    </IconBase>
);

export const EyeSlashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></IconBase>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></IconBase>
);

export const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></IconBase>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></IconBase>
);

export const HandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" /></IconBase>
);

export const ZoomInIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" /></IconBase>
);

export const KeyboardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h.01M10 8h.01M13 8h.01M16 8h.01M7 12h.01M10 12h.01M13 12h.01M16 12h.01M8 16h8" />
    </IconBase>
);

export const SlidersIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 0V20.25m6-9V3.75m0 7.5a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 0V20.25m6-13.5V3.75m0 3.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 0V20.25" />
    </IconBase>
);

export const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </IconBase>
);

export const AdjustmentsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <IconBase className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
    </IconBase>
);

