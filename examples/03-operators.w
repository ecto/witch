(if (< 2 1)
  (log "something is wrong")
  (log "2 is greater than 1"))

(fn animal-sound (sound) (
  (if (= sound "moo") (log "cow"))
  (if (= sound "woof") (log "dog"))
  (if (= sound "meow") (log "cat"))
))
(animal-sound "woof")
