import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ToastProvider, useToast } from '@/Components/ToastContext';

// Helper component to trigger toasts from tests
function ToastTrigger() {
    const toast = useToast();
    return (
        <div>
            <button onClick={() => toast.success('Success message')}>Add Success</button>
            <button onClick={() => toast.error('Error message')}>Add Error</button>
            <button onClick={() => toast.info('Info message')}>Add Info</button>
        </div>
    );
}

function renderWithToast() {
    return render(
        <ToastProvider>
            <ToastTrigger />
        </ToastProvider>,
    );
}

describe('ToastContext', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders a success toast when triggered', () => {
        renderWithToast();

        act(() => {
            fireEvent.click(screen.getByText('Add Success'));
        });

        expect(screen.getByText('Success message')).toBeInTheDocument();
        expect(screen.getByText('Success message').closest('[role="alert"]')).toBeInTheDocument();
    });

    it('renders an error toast when triggered', () => {
        renderWithToast();

        act(() => {
            fireEvent.click(screen.getByText('Add Error'));
        });

        expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('renders an info toast when triggered', () => {
        renderWithToast();

        act(() => {
            fireEvent.click(screen.getByText('Add Info'));
        });

        expect(screen.getByText('Info message')).toBeInTheDocument();
    });

    it('auto-dismisses toast after 3 seconds', () => {
        renderWithToast();

        act(() => {
            fireEvent.click(screen.getByText('Add Success'));
        });
        expect(screen.getByText('Success message')).toBeInTheDocument();

        // Advance past the 3s auto-dismiss
        act(() => {
            vi.advanceTimersByTime(3100);
        });

        expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });

    it('limits visible toasts to 3', () => {
        renderWithToast();

        act(() => {
            fireEvent.click(screen.getByText('Add Success'));
            fireEvent.click(screen.getByText('Add Error'));
            fireEvent.click(screen.getByText('Add Info'));
            fireEvent.click(screen.getByText('Add Success'));
        });

        // Should have 3 toasts visible (oldest was trimmed)
        const alerts = screen.getAllByRole('alert');
        expect(alerts.length).toBe(3);

        // First toast ("Success message" #1) should have been trimmed,
        // Error and Info remain, plus a new Success
        expect(screen.getByText('Error message')).toBeInTheDocument();
        expect(screen.getByText('Info message')).toBeInTheDocument();
    });

    it('dismisses toast on click', () => {
        renderWithToast();

        act(() => {
            fireEvent.click(screen.getByText('Add Success'));
        });
        expect(screen.getByText('Success message')).toBeInTheDocument();

        // Click the toast to dismiss
        act(() => {
            fireEvent.click(screen.getByText('Success message'));
        });

        // Wait for the 200ms exit animation
        act(() => {
            vi.advanceTimersByTime(250);
        });

        expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });

    it('dismisses toast via close button', () => {
        renderWithToast();

        act(() => {
            fireEvent.click(screen.getByText('Add Success'));
        });

        const dismissButton = screen.getByLabelText('Dismiss');

        act(() => {
            fireEvent.click(dismissButton);
        });

        act(() => {
            vi.advanceTimersByTime(250);
        });

        expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });

    it('throws when useToast is used outside ToastProvider', () => {
        function BadComponent() {
            useToast();
            return null;
        }

        // Suppress the error boundary console output
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => render(<BadComponent />)).toThrow(
            'useToast must be used within a ToastProvider',
        );

        consoleSpy.mockRestore();
    });
});
