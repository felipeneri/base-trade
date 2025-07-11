export const Footer = () => {
  return (
    <footer className="py-4 border-t border-border text-center text-sm text-muted-foreground">
      <p>
        &copy; {new Date().getFullYear()}{" "}
        <a href="https://www.google.com">Base Trade</a>
      </p>
    </footer>
  );
};
