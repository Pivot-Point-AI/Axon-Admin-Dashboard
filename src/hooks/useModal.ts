"use client";

import { useCallback, useState } from "react";

export default function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen((open) => !open), []);
  return { isOpen, openModal, closeModal, toggleModal };
}
