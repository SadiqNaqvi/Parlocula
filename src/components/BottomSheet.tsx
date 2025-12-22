"use client";

import { forwardRef, MutableRefObject, PropsWithChildren, useEffect, useImperativeHandle, useState } from "react";
import { Root, Overlay, Portal, Content, Handle, Drawer } from "vaul";

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
    <Overlay className="fixed inset-0 bg-black/40" />
    <Content ref={ref} className="h-fit fixed bottom-0 left-0 right-0 outline-none">
      {allowHandle && <Handle />}
      {children}
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
      {button && (
        <Drawer.Trigger className={className}>{button}</Drawer.Trigger>
      )}
      <DrawerPortal allowHandle={allowHandle}>
        <aside className="mx-auto w-full max-w-screen-sm">
          {children}
        </aside>
      </DrawerPortal>
    </Root>
  )
});

BottomSheet.displayName = "BottomSheet";

export default BottomSheet;