"use client";

import { forwardRef, MutableRefObject, PropsWithChildren, useEffect, useImperativeHandle, useState } from "react";
import { Root, Overlay, Portal, Content, Handle, Drawer } from "vaul";
import { OptionalChildren } from "./ui";

type PortalProps = PropsWithChildren<{
  allowHandle?: boolean
  ref?: MutableRefObject<any>,
  title?: string;
  description?: string;
}>

export const NestedSheet = ({ button, children, className }: PropsWithChildren<{ className?: string, button: React.ReactNode }>) => {
  return (
    <Drawer.NestedRoot>
      <Drawer.Trigger className={className}>{button}</Drawer.Trigger>
      <DrawerPortal>{children}</DrawerPortal>
    </Drawer.NestedRoot>
  )
}

export const DrawerPortal = ({ children, allowHandle, description, title, ref }: PortalProps) => (
  <Portal>
    <Overlay className="z-[10] fixed inset-0 bg-black/40" />
    <Drawer.Title>{title}</Drawer.Title>
    <Drawer.Description>{description}</Drawer.Description>
    <Content ref={ref} className="h-fit fixed z-[10] rounded-t-md sm:rounded-md border-t border-gray60 bottom-0 left-0 right-0 outline-none bg-primary py-4">
      <Handle />
      <aside className="*:mx-auto mt-4 min-h-40 w-full *:max-w-96 max-h-[80dvh] overflow-y-auto">
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

  const [open, setOpen] = useState<boolean | undefined>(state);

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!open),
  }));

  return (
    <Root snapPoints={snapPoints} open={open} onClose={onClose}>
      <OptionalChildren condition={button}>
        <Drawer.Trigger className={className}>{button}</Drawer.Trigger>
      </OptionalChildren>
      <DrawerPortal title={title} description={description} allowHandle={allowHandle}>
        {children}
      </DrawerPortal>
    </Root>
  )
});

BottomSheet.displayName = "BottomSheet";

export default BottomSheet;