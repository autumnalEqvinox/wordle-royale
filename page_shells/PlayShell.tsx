export default function PlayPageShell() {
  return (
    <div className="flex flex-col items-center">
      {/* 30 game boxes: 5 columns, 6 rows */}
      <div className="grid grid-cols-5 grid-rows-6 gap-2">
        {Array.from({ length: 30 }, (_, index) => (
          <div
            key={index}
            className="flex h-15 w-15 items-center justify-center border-2 border-gray-500 text-3xl font-bold"
          />
        ))}
      </div>

      {/* Keyboard placeholder rows */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="flex gap-2">
          {Array.from({ length: 10 }, (_, index) => (
            <div
              key={index}
              className="h-10 w-10 rounded bg-gray-500"
            />
          ))}
        </div>

        <div className="flex gap-2">
          {Array.from({ length: 9 }, (_, index) => (
            <div
              key={index}
              className="h-10 w-10 rounded bg-gray-500"
            />
          ))}
          <div key={51}
                className="h-10 w-12 pl-2 bg-gray-500"/>
        </div>

        <div className="flex gap-2">
          {Array.from({ length: 7 }, (_, index) => (
              <div
              key={index}
              className="h-10 w-10 rounded bg-gray-500"
              />
            ))}
            <div key={52}
                className="h-10 w-25 bg-gray-500"/>
        </div>
      </div>
    </div>
  );
}