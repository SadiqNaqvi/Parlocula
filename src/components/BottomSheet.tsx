"use client";

import { forwardRef, PropsWithChildren, RefObject, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Content, Drawer, Handle, Overlay, Portal, Root } from "vaul";
import { OptionalChildren } from "./ui";

type PortalProps = PropsWithChildren<{
  allowHandle?: boolean
  ref?: RefObject<HTMLDivElement | null>,
  title?: string;
  description?: string;
}>

export const NestedSheet = forwardRef(({ children, description, title, state, onClose, snapPoints, allowHandle, button, className }: BottomSheetProps, ref) => {

  const [open, setOpen] = useState<boolean | undefined>(state);

  const sheetId = useRef(Math.random().toString(36));

  useEffect(() => {
    if (!open) return;

    let isPopped = false;

    const handleBackNavigation = (event: PopStateEvent) => {
      if (!open) return;

      // Only handle if this sheet owns the state
      if (event.state?.sheetId !== sheetId.current) return;

      isPopped = true;
      setOpen(false);
      onClose?.();
    };

    window.history.pushState({ sheetId: sheetId.current }, "");
    window.addEventListener("popstate", handleBackNavigation);

    return () => {
      window.removeEventListener("popstate", handleBackNavigation);

      if (!isPopped && window.history.state?.sheetId === sheetId.current) {
        window.history.back();
      }
    };
  }, [open]);

  useEffect(() => { setOpen(!!state) }, [state]);

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!open),
  }));

  const handleClick = () => {
    setOpen(!open);
  }

  const handleOnClose = () => {
    setOpen(false);
    onClose?.();
  }

  return (
    <Drawer.NestedRoot snapPoints={snapPoints} open={open} onClose={handleOnClose}>
      <OptionalChildren condition={button}>
        <Drawer.Trigger onClick={handleClick} className={className}>{button}</Drawer.Trigger>
      </OptionalChildren>
      <DrawerPortal title={title} description={description} allowHandle={allowHandle}>
        {children}
      </DrawerPortal>
    </Drawer.NestedRoot>
  )
})

export const DrawerPortal = ({ children, allowHandle = true, description, title, ref }: PortalProps) => (
  <Portal>
    <Overlay className="z-10 fixed inset-0 bg-black/40" />
    <Content ref={ref} className="h-fit fixed z-10 border-t border-gray60 bottom-0 left-0 right-0 outline-none bg-primary py-4 sm:max-w-100 sm:mx-auto sm:border-0 sm:rounded-md sm:bottom-2 sm:overflow-hidden">
      <OptionalChildren condition={allowHandle}>
        <Handle />
      </OptionalChildren>
      <Drawer.Title className="parloHeading text-center my-2">{title}</Drawer.Title>
      <Drawer.Description className="text-center mt-2">{description}</Drawer.Description>
      <aside className="sheetContainer mt-4 min-h-40 w-full max-h-[80dvh] overflow-y-auto">
        {children}
      </aside>
    </Content>
  </Portal>
)

export type BottomSheetProps = PortalProps & {
  state?: boolean,
  onClose?: (...a: any) => any,
  button?: React.ReactNode,
  className?: string,
  snapPoints?: (string | number)[],
}

export type BottomSheetRef = {
  open: () => void,
  close: () => void,
  toggle: () => void,
}

export const BottomSheet = forwardRef(({ children, description, title, state, onClose, snapPoints, allowHandle, button, className }: BottomSheetProps, ref) => {

  const [open, setOpen] = useState<boolean>(false);
  const sheetId = useRef(Math.random().toString(36));

  useEffect(() => {
    if (!open) return;

    let isPopped = false;

    const handleBackNavigation = (event: PopStateEvent) => {
      if (!open) return;

      // Only handle if this sheet owns the state
      if (event.state?.sheetId === sheetId.current) return;

      isPopped = true;
      setOpen(false);
      onClose?.();
    };

    window.history.pushState({ sheetId: sheetId.current }, "");
    window.addEventListener("popstate", handleBackNavigation);

    return () => {
      window.removeEventListener("popstate", handleBackNavigation);

      if (!isPopped && window.history.state?.sheetId === sheetId.current) {
        window.history.back();
      }
    };
  }, [open]);

  useEffect(() => { setOpen(!!state) }, [state]);

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!open),
  }));

  const handleClick = () => {
    setOpen(!open);
  }

  const handleOnClose = () => {
    setOpen(false);
    onClose?.();
  }

  return (
    <Root snapPoints={snapPoints} open={open} onClose={handleOnClose}>
      <OptionalChildren condition={button}>
        <Drawer.Trigger onClick={handleClick} className={className}>{button}</Drawer.Trigger>
      </OptionalChildren>
      <DrawerPortal title={title} description={description} allowHandle={allowHandle}>
        {children}
      </DrawerPortal>
    </Root>
  )
});

BottomSheet.displayName = "BottomSheet";

export default BottomSheet;