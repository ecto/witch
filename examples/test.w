(= {hello} "world")
(print hello)

(=
  {print-hello-world}
  {fn () (
    (print "hello world")
  )}
)

(print-hello-world "")
