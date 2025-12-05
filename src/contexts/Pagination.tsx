import { createContext, useState } from "react"
import type { Dispatch, SetStateAction, ReactNode } from "react"

interface PageContextType {
    pageNum: number
    setPageNum: Dispatch<SetStateAction<number>>
    pageSize: number
    setPageSize: Dispatch<SetStateAction<number>>
}

export const PageContainer = createContext<PageContextType | undefined>(undefined);

interface PaginationProps {
    children : ReactNode
}

function Pagination({ children }: PaginationProps) {

    const [pageNum, setPageNum] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(5);

    const contextValue: PageContextType = {
    pageNum,
    setPageNum,
    pageSize,
    setPageSize,
  };

    return (
        <div>
            <PageContainer.Provider value={contextValue}>
                {children}
            </PageContainer.Provider>
        </div>
    )
}

export default Pagination;