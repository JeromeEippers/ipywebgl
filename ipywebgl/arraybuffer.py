import numpy as np 

def array_to_buffer(ar):
    """Turn a NumPy array into a binary buffer."""
    # Unsupported int64 array JavaScript side
    if ar.dtype == np.int64:
        ar = ar.astype(np.int32)

    # Unsupported float16 array JavaScript side
    if ar.dtype == np.float16:
        ar = ar.astype(np.float32)

    # make sure it's contiguous
    if not ar.flags["C_CONTIGUOUS"]:
        ar = np.ascontiguousarray(ar)

    return {"shape": list(ar.shape), "dtype": str(ar.dtype)}, memoryview(ar.flatten())
