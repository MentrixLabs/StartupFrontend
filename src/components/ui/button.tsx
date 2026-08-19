import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      // Every non-`link` variant pins BOTH its resting and its hover text color.
      // That is redundant for a real <button> (which inherits body color), but it is
      // load-bearing for `asChild`: the rendered child is usually an <a>, and
      // src/index.css declares `a { color: blue-600 }` / `a:hover { color: blue-700 }`
      // as bare element rules. A direct element rule beats an inherited color, so a
      // variant that leaves text color unset would render blue text on the variant's
      // background (blue-on-blue for `default`). Pinning the color puts the value on
      // the element itself, where it wins.
      variant: {
        default: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300",
        destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-lg",
        outline: "border border-gray-300/50 dark:border-gray-700/50 bg-transparent backdrop-blur-sm hover:bg-white/10 dark:hover:bg-white/5",
        secondary: "bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white hover:bg-gray-200/90",
        ghost: "text-gray-900 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-100", // <-- добавьте эту строку
        link: "text-blue-600 hover:underline",
      },
      size: {
        default: "h-10 py-2 px-4 text-sm",
        sm: "h-9 px-3 text-sm",
        lg: "h-11 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, disabled, children, ...props }, ref) => {
    const isDisabled = disabled || isLoading;

    // `asChild` renders the child element ITSELF with the button's classes merged onto
    // it — it does not wrap the child. Wrapping in a <span> put the styling on the
    // wrapper: padding/height lived on the span so only the child's text run was
    // clickable (dead click zone around it), and the child <a> kept its own color from
    // the base `a` rule instead of the button's. Cloning is the same approach Radix's
    // Slot takes internally; hand-rolled here to avoid adding a dependency.
    if (asChild) {
      const child = React.Children.only(children) as React.ReactElement<{
        className?: string;
      }>;
      return React.cloneElement(child, {
        ...props,
        ...child.props,
        // Child's own className is merged last so a call site can still override a
        // variant class, matching the non-asChild path's merge order.
        className: cn(
          buttonVariants({ variant, size, className }),
          // `disabled:` variants key off the :disabled pseudo-class, which never
          // matches an <a>, so the disabled look has to be applied unconditionally.
          isDisabled && "opacity-50 pointer-events-none",
          child.props.className
        ),
        // NOTE: the isLoading spinner is intentionally not injected in this path — the
        // child is an arbitrary element and prepending to its children is not safe in
        // general. `aria-busy`/`aria-disabled` still convey the state. No current call
        // site combines asChild with isLoading.
        "aria-busy": isLoading || undefined,
        "aria-disabled": isDisabled || undefined,
        ...(ref ? { ref } : {}),
      } as React.Attributes & Record<string, unknown>);
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };