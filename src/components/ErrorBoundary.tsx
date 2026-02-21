import { Component, ErrorInfo, ReactNode } from 'react'
import { T } from '../constants/theme'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, info.componentStack)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className={`${T.page} min-h-screen flex items-center justify-center p-8`}>
                    <div className={`${T.card} p-8 max-w-lg text-center`}>
                        <h2 className={`text-lg font-semibold ${T.t1} mb-2`}>
                            予期しないエラーが発生しました
                        </h2>
                        <p className={`text-sm ${T.t3} mb-4`}>
                            {this.state.error?.message || '不明なエラー'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${T.btnAccent}`}
                        >
                            ページを再読み込み
                        </button>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}
