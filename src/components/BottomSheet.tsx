"use client";

import { forwardRef, MutableRefObject, PropsWithChildren, useEffect, useImperativeHandle, useState } from "react";
import { Root, Overlay, Portal, Content, Handle, Drawer } from "vaul";
import { OptionalChildren } from "./ui";

type PortalProps = PropsWithChildren<{
  allowHandle?: boolean
  ref?: MutableRefObject<any>,
}>

export const NestedSheet = ({ button, children, className }: PropsWithChildren<{ className?: string, button: React.ReactNode }>) => {
  return (
    <Drawer.NestedRoot>
      <Drawer.Trigger className={className}>{button}</Drawer.Trigger>
      <DrawerPortal>{children}</DrawerPortal>
    </Drawer.NestedRoot>
  )
}

export const DrawerPortal = ({ children, allowHandle, ref }: PortalProps) => (
  <Portal>
    <Overlay className="z-[10] fixed inset-0 bg-black/40" />
    <Drawer.Title />
    <Drawer.Description />
    <Content ref={ref} className="h-fit fixed z-[10] bottom-0 left-0 right-0 outline-none">
      <aside className="mx-auto sm:mb-4 rounded-t-md sm:rounded-md w-full max-w-96 bg-primarylight">
        {allowHandle && <Handle />}
        {children}
      </aside>
    </Content>
  </Portal>
)

type BottomSheetProps = PortalProps & {
  state?: boolean,
  onClose?: (...a: any) => any,
  button?: React.ReactNode,
  className?: string,
}

export type BottomSheetRef = {
  open: () => void,
  close: () => void,
  toggle: () => void,
}

export const BottomSheet = forwardRef(({ children, state, onClose, allowHandle, button, className }: BottomSheetProps, ref) => {

  const [open, setOpen] = useState<boolean | undefined>(state);

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!open),
  }));

  return (
    <Root open={open} onClose={onClose}>
      <OptionalChildren condition={button}>
        <Drawer.Trigger className={className}>{button}</Drawer.Trigger>
      </OptionalChildren>
      <DrawerPortal allowHandle={allowHandle}>
        {children}
      </DrawerPortal>
    </Root>
  )
});

BottomSheet.displayName = "BottomSheet";

export default BottomSheet;