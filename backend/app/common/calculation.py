from collections import OrderedDict


class Calculation():
    def __init__(self, hyps, refs, scores):
        self.scores = scores
        self.hyps = hyps
        self.refs = refs


class SavedCalculations(OrderedDict):
    def __setitem__(self, name, calculation):
        assert isinstance(calculation, Calculation)
        oldname = name
        i = 1

        while name in self:
            name = oldname + "-" + str(i)
            i += 1

        super().__setitem__(name, calculation)

    def __iter__(self):
        yield from reversed(list(map(lambda x: (x[0], x[1].scores), self.items())))