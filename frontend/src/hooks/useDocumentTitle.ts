import { useEffect } from "react";
//* Function for use document title
export function useDocumentTitle(title: string) {
  //* Function for this task
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | CollabSpace` : "CollabSpace";
    //* Function for this task
    return () => {
      document.title = prev;
    };
  }, [title]);
}